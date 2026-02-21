/*
  Warnings:

  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - Added the required column `base_price` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "price",
ADD COLUMN     "base_price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "has_variants" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "attributes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_values" (
    "id" SERIAL NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "additional_price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_attribute_values" (
    "id" SERIAL NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "attribute_value_id" INTEGER NOT NULL,

    CONSTRAINT "variant_attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attribute_values_attribute_id_product_id_key" ON "attribute_values"("attribute_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "variant_attribute_values_product_variant_id_attribute_value_key" ON "variant_attribute_values"("product_variant_id", "attribute_value_id");

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- 1. Расчет текущей суммы корзины
CREATE OR REPLACE FUNCTION get_cart_total(c_id INT) RETURNS DECIMAL AS $$
BEGIN
    RETURN (SELECT COALESCE(SUM(p.price * ci.quantity), 0) 
            FROM cart_items ci JOIN products p ON ci.product_id = p.id 
            WHERE ci.cart_id = c_id);
END; $$ LANGUAGE plpgsql;

-- 2. Сборка полного адреса в одну строку
CREATE OR REPLACE FUNCTION get_full_address(addr_id INT) RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT city || ', ' || street FROM addresses WHERE id = addr_id);
END; $$ LANGUAGE plpgsql;

-- 3. Проверка: является ли пользователь "VIP" (потратил > 1000)
CREATE OR REPLACE FUNCTION is_user_vip(u_id INT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT total_spent > 1000 FROM users WHERE id = u_id);
END; $$ LANGUAGE plpgsql;

-- 4. Проверка срока действия промокода
CREATE OR REPLACE FUNCTION is_promo_active(p_id INT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM promocodes WHERE id = p_id AND valid_until > NOW());
END; $$ LANGUAGE plpgsql;

-- 5. Получение общего остатка товара на всех складах
CREATE OR REPLACE FUNCTION get_total_stock(p_id INT) RETURNS INT AS $$
BEGIN
    RETURN (SELECT COALESCE(SUM(quantity), 0) FROM stocks WHERE product_id = p_id);
END; $$ LANGUAGE plpgsql;

-- 6. Форматирование цены (добавляет валюту)
CREATE OR REPLACE FUNCTION format_price(val DECIMAL) RETURNS TEXT AS $$
BEGIN
    RETURN val::TEXT || ' BYN';
END; $$ LANGUAGE plpgsql;

-- 7. Оценка времени доставки (простая логика для курсовой)
CREATE OR REPLACE FUNCTION estimate_delivery_days(city_name TEXT) RETURNS INT AS $$
BEGIN
    IF city_name = 'Минск' THEN RETURN 1; ELSE RETURN 3; END IF;
END; $$ LANGUAGE plpgsql;

-- 1. Оформление заказа (перенос из корзины в заказ)
CREATE OR REPLACE PROCEDURE create_order_from_cart(u_id INT, addr_id INT) AS $$
DECLARE
    new_order_id INT;
    v_cart_id INT;
BEGIN
    SELECT id INTO v_cart_id FROM carts WHERE user_id = u_id;
    
    INSERT INTO orders (user_id, address_id, total_price, status, delivery_city, delivery_street, created_at, updated_at)
    SELECT u_id, addr_id, get_cart_total(v_cart_id), 'PENDING', a.city, a.street, NOW(), NOW()
    FROM addresses a WHERE a.id = addr_id RETURNING id INTO new_order_id;

    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
    SELECT new_order_id, ci.product_id, ci.quantity, p.price
    FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = v_cart_id;

    DELETE FROM cart_items WHERE cart_id = v_cart_id;
END; $$ LANGUAGE plpgsql;

-- 2. Массовое пополнение склада (Restock)
CREATE OR REPLACE PROCEDURE bulk_restock(w_id INT, amount INT) AS $$
BEGIN
    UPDATE stocks SET quantity = quantity + amount WHERE warehouse_id = w_id;
END; $$ LANGUAGE plpgsql;

-- 3. Применение скидки ко всей категории (Черная пятница)
CREATE OR REPLACE PROCEDURE apply_category_discount(cat_id INT, discount_percent DECIMAL) AS $$
BEGIN
    UPDATE products SET price = price * (1 - discount_percent / 100) WHERE category_id = cat_id;
END; $$ LANGUAGE plpgsql;

-- 4. Отмена старых неоплаченных заказов (старше 3 дней)
CREATE OR REPLACE PROCEDURE cancel_stale_orders() AS $$
BEGIN
    UPDATE orders SET status = 'CANCELED' WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '3 days';
END; $$ LANGUAGE plpgsql;

-- 5. Архивирование старых логов (удаление записей старше года)
CREATE OR REPLACE PROCEDURE archive_audit_logs() AS $$
BEGIN
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
END; $$ LANGUAGE plpgsql;

-- 6. Слияние двух пользователей (если юзер создал дубликат)
CREATE OR REPLACE PROCEDURE merge_user_data(old_u_id INT, new_u_id INT) AS $$
BEGIN
    UPDATE orders SET user_id = new_u_id WHERE user_id = old_u_id;
    UPDATE reviews SET user_id = new_u_id WHERE user_id = old_u_id;
    DELETE FROM users WHERE id = old_u_id;
END; $$ LANGUAGE plpgsql;

-- 7. Инициализация пустой корзины для нового пользователя
CREATE OR REPLACE PROCEDURE init_user_cart(u_id INT) AS $$
BEGIN
    INSERT INTO carts (user_id) VALUES (u_id) ON CONFLICT DO NOTHING;
END; $$ LANGUAGE plpgsql;

-- 1. Триггер: Обновление рейтинга товара после нового отзыва
CREATE OR REPLACE FUNCTION fn_update_product_rating() RETURNS TRIGGER AS $$
BEGIN
    UPDATE products SET average_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_update_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION fn_update_product_rating();

-- 2. Триггер: Запись в AuditLog при изменении роли пользователя
CREATE OR REPLACE FUNCTION fn_log_role_change() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role <> NEW.role THEN
        INSERT INTO audit_logs (user_id, action, entity_id, entity_type, details, created_at)
        VALUES (NEW.id, 'CHANGE_ROLE', NEW.id, 'User', 'From ' || OLD.role || ' to ' || NEW.role, NOW());
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_log_role AFTER UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_log_role_change();

-- 3. Триггер: Авто-расчет общей суммы заказа при добавлении позиций
CREATE OR REPLACE FUNCTION fn_recalc_order_total() RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders SET total_price = (SELECT SUM(price_at_purchase * quantity) FROM order_items WHERE order_id = NEW.order_id)
    WHERE id = NEW.order_id;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_recalc_order AFTER INSERT OR UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION fn_recalc_order_total();

-- 4. Триггер: Проверка промокода перед оформлением заказа
CREATE OR REPLACE FUNCTION fn_check_promo_before_order() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.promocode_id IS NOT NULL AND NOT is_promo_active(NEW.promocode_id) THEN
        RAISE EXCEPTION 'Данный промокод уже не действителен!';
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_check_promo BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION fn_check_promo_before_order();

-- 5. Триггер: Обновление User.totalSpent при успешной доставке заказа
CREATE OR REPLACE FUNCTION fn_update_user_spending() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'DELIVERED' AND OLD.status <> 'DELIVERED' THEN
        UPDATE users SET total_spent = total_spent + NEW.total_price WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_user_spending AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION fn_update_user_spending();

-- 6. Триггер: Запрет на удаление товара, если он есть в активных заказах
CREATE OR REPLACE FUNCTION fn_prevent_product_delete() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = OLD.id AND o.status = 'PENDING') THEN
        RAISE EXCEPTION 'Нельзя удалить товар, который находится в обработке в активном заказе!';
    END IF;
    RETURN OLD;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_protect_product BEFORE DELETE ON products FOR EACH ROW EXECUTE FUNCTION fn_prevent_product_delete();

-- 7. Триггер: Автоматическое скрытие товара (isAvailable = false) если остаток 0
CREATE OR REPLACE FUNCTION fn_auto_hide_product() RETURNS TRIGGER AS $$
BEGIN
    IF get_total_stock(NEW.product_id) <= 0 THEN
        UPDATE products SET is_available = false WHERE id = NEW.product_id;
    ELSE
        UPDATE products SET is_available = true WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_stock_availability AFTER UPDATE ON stocks FOR EACH ROW EXECUTE FUNCTION fn_auto_hide_product();


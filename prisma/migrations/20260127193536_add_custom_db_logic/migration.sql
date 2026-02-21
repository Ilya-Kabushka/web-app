-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'ANALYTICS', 'WAREHOUSE_WORKER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED');

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "parent_category_id" INTEGER,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "average_rating" DECIMAL(3,2) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "first_name" TEXT,
    "last_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "avatar_url" TEXT,
    "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "post_code" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "address_id" INTEGER,
    "delivery_city" TEXT NOT NULL,
    "delivery_street" TEXT NOT NULL,
    "promocode_id" INTEGER,
    "payment_method_id" INTEGER,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promocodes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promocodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entity_id" INTEGER,
    "entity_type" TEXT,
    "details" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_parent_category_id_id_idx" ON "categories"("parent_category_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "category_images_category_id_key" ON "category_images"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_product_id_warehouse_id_key" ON "stocks"("product_id", "warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_key" ON "cart_items"("cart_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_product_id_key" ON "reviews"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "promocodes_code_key" ON "promocodes"("code");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_images" ADD CONSTRAINT "category_images_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_promocode_id_fkey" FOREIGN KEY ("promocode_id") REFERENCES "promocodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


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


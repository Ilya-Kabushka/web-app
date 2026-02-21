-- Исправление триггера для автоматического скрытия товаров
-- Триггер должен срабатывать при INSERT, UPDATE и DELETE операциях на таблице stocks

-- Удаляем старый триггер
DROP TRIGGER IF EXISTS trg_stock_availability ON stocks;

-- Обновляем функцию для работы с INSERT, UPDATE и DELETE
CREATE OR REPLACE FUNCTION fn_auto_hide_product() RETURNS TRIGGER AS $$
DECLARE
    v_product_id INT;
    v_total_stock INT;
BEGIN
    -- Определяем product_id в зависимости от типа операции
    IF TG_OP = 'DELETE' THEN
        v_product_id := OLD.product_id;
    ELSE
        v_product_id := NEW.product_id;
    END IF;
    
    -- Вычисляем общий остаток товара на всех складах
    SELECT COALESCE(SUM(quantity), 0) INTO v_total_stock
    FROM stocks
    WHERE product_id = v_product_id;
    
    -- Обновляем статус доступности товара
    IF v_total_stock <= 0 THEN
        UPDATE products SET is_available = false WHERE id = v_product_id;
    ELSE
        UPDATE products SET is_available = true WHERE id = v_product_id;
    END IF;
    
    -- Возвращаем соответствующую запись в зависимости от типа операции
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END; $$ LANGUAGE plpgsql;

-- Создаем триггеры для всех операций
CREATE TRIGGER trg_stock_availability_after_insert
    AFTER INSERT ON stocks
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_hide_product();

CREATE TRIGGER trg_stock_availability_after_update
    AFTER UPDATE ON stocks
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_hide_product();

CREATE TRIGGER trg_stock_availability_after_delete
    AFTER DELETE ON stocks
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_hide_product();


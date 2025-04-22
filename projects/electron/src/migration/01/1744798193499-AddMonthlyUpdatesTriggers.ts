import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMonthlyUpdatesTriggers1744798193499 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create the function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION notify_monthly_update()
             RETURNS trigger AS $$
            DECLARE
                payload JSON;
            BEGIN
                payload := json_build_object(
                    'monthlyId', NEW."monthlyId",
                    'operation', NEW.operation
                );
                PERFORM pg_notify('monthly_update_channel', payload::text);
                RETURN NULL; -- Skip insert
            END;
            $$ LANGUAGE plpgsql;
        `);

        // 2. Create the trigger on INSERT
        await queryRunner.query(`
            CREATE TRIGGER trigger_notify_and_skip
            BEFORE INSERT ON monthlyupdates
            FOR EACH ROW
            EXECUTE FUNCTION notify_monthly_update();
        `);

        // 1. Create the function that inserts into monthlyupdates (ignoring duplicates)
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION insert_into_monthlyupdates(p_monthly_id INT, p_op TEXT)
            RETURNS VOID AS $$
            BEGIN
                INSERT INTO monthlyupdates ("monthlyId", operation)
                VALUES (p_monthly_id, p_op)
                ON CONFLICT ("monthlyId", operation) DO NOTHING;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // 2. Function for triggers on MONTHLIES
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION trg_monthlies_update()
            RETURNS TRIGGER AS $$
            DECLARE
                m_id INT;
            BEGIN
                IF (TG_OP = 'DELETE') THEN
                    m_id := OLD.id;
                ELSE
                    m_id := NEW.id;
                END IF;

                PERFORM insert_into_monthlyupdates(m_id, TG_OP);
                RETURN COALESCE(NEW, OLD); -- Return the right row
            END;
            $$ LANGUAGE plpgsql;
        `);

        // 3. Function for triggers on child tables (marches, notes, invoices)
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION trg_related_to_monthlies_update()
            RETURNS TRIGGER AS $$
            DECLARE
                m_id INT;
            BEGIN
                IF (TG_OP = 'DELETE') THEN
                    m_id := OLD."monthlyId";
                ELSE
                    m_id := NEW."monthlyId";
                END IF;

                PERFORM insert_into_monthlyupdates(m_id, TG_OP);
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION trg_invoicelines_update()
            RETURNS TRIGGER AS $$
            DECLARE
                inv_id INT;
                m_id INT;
            BEGIN
                IF (TG_OP = 'DELETE') THEN
                    inv_id := OLD."invoiceId";
                ELSE
                    inv_id := NEW."invoiceId";
                END IF;
        
                SELECT "monthlyId" INTO m_id FROM invoices WHERE id = inv_id;
        
                IF m_id IS NOT NULL THEN
                    PERFORM insert_into_monthlyupdates(m_id, TG_OP);
                END IF;
        
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        `);

        // 4. Create triggers on monthlies
        await queryRunner.query(`
            CREATE TRIGGER trg_monthlies_changes
            AFTER INSERT OR UPDATE OR DELETE ON monthlies
            FOR EACH ROW
            EXECUTE FUNCTION trg_monthlies_update();
        `);

        // 5. Triggers on related tables
        await queryRunner.query(`
            CREATE TRIGGER trg_marches_changes
            AFTER INSERT OR UPDATE OR DELETE ON marches
            FOR EACH ROW
            EXECUTE FUNCTION trg_related_to_monthlies_update();
        `);
        await queryRunner.query(`
            CREATE TRIGGER trg_notes_changes
            AFTER INSERT OR UPDATE OR DELETE ON notes
            FOR EACH ROW
            EXECUTE FUNCTION trg_related_to_monthlies_update();
        `);
        await queryRunner.query(`
            CREATE TRIGGER trg_invoices_changes
            AFTER INSERT OR UPDATE OR DELETE ON invoices
            FOR EACH ROW
            EXECUTE FUNCTION trg_related_to_monthlies_update();
        `);
        await queryRunner.query(`
            CREATE TRIGGER trg_invoicelines_changes
            AFTER INSERT OR UPDATE OR DELETE ON invoicelines
            FOR EACH ROW
            EXECUTE FUNCTION trg_invoicelines_update();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop trigger first
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trigger_notify_monthly_update ON monthlyupdates;
        `);

        // Then drop the function
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS notify_monthly_update;
        `);

        const dropTriggers = async (table: string) => {
            await queryRunner.query(`DROP TRIGGER IF EXISTS trg_${table}_changes ON ${table};`);
        };

        // Drop triggers from all tables
        await dropTriggers("monthlies");
        await dropTriggers("marches");
        await dropTriggers("invoices");
        await dropTriggers("notes");

        // Drop functions
        await queryRunner.query(`DROP FUNCTION IF EXISTS trg_monthlies_update;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS trg_related_to_monthlies_update;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS insert_into_monthlyupdates;`);
    }

}

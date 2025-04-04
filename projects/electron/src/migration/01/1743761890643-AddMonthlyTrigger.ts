import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMonthlyTrigger1743761890643 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION notify_monthly_update()
            RETURNS trigger AS $$
            DECLARE
              payload TEXT;
            BEGIN
              IF (TG_OP = 'DELETE') THEN
                payload := json_build_object(
                  'id', OLD.id,
                  'operation', TG_OP
                )::TEXT;
              ELSE
                payload := json_build_object(
                  'id', NEW.id,
                  'operation', TG_OP
                )::TEXT;
              END IF;
          
              PERFORM pg_notify('monthly_update_channel', payload);
              RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
          `);

        await queryRunner.query(`
            CREATE OR REPLACE TRIGGER trigger_monthly_update
            AFTER INSERT OR UPDATE OR DELETE ON monthlies
            FOR EACH ROW EXECUTE FUNCTION notify_monthly_update();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_monthly_update ON monthlies`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS notify_monthly_update()`);
    }
}

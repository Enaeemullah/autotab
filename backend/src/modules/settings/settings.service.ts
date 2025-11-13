import { AppDataSource } from '../../database/data-source';
import { Setting } from '../../database/entities/setting.entity';
import { updateSettingsSchema, UpdateSettingInput } from './settings.schemas';

export class SettingsService {
  private settingRepository = AppDataSource.getRepository(Setting);

  async list(tenantId: string, branchId: string | null) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;
    return this.settingRepository.find({ where, order: { key: 'ASC' } });
  }

  async upsert(tenantId: string, branchId: string | null, payload: unknown) {
    const parsed = updateSettingsSchema.parse(payload);
    let setting = await this.settingRepository.findOne({
      where: { tenantId, branchId: branchId ?? null, key: parsed.key }
    });
    if (!setting) {
      setting = this.settingRepository.create({
        tenantId,
        branchId,
        key: parsed.key,
        value: parsed.value,
        syncState: 'pending'
      });
    } else {
      setting.value = parsed.value;
      setting.syncState = 'pending';
    }
    return this.settingRepository.save(setting);
  }
}

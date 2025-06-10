import { AppDataSource } from "../datasource";
import { MarchEntity } from "../entity/March";
import { StopperEntity } from "../entity/Stopper";
import { IMarchEntity, StepType, IStopperEntity } from "../interfaces";
import { UserController } from "./UserController";

export const MarchController = {
  async updateMarchValue(march: IMarchEntity) {
    const update: Partial<MarchEntity> = {
      value: march.value
    };

    if (march.type === StepType.GYR && march.value === 1) {
      update.finishedAt = new Date();
    }
    if (march.type === StepType.GR && march.value === 1) {
      update.finishedAt = new Date();
    }
    if (march.type === StepType.DATE && march.value === 1) {
      update.finishedAt = march.finishedAt;
    }

    await AppDataSource
      .getRepository(MarchEntity)
      .update(march.id, update);
  },

  async addStopper(march: IMarchEntity, time: number, from: Date): Promise<IStopperEntity> {
    let marchEntity = await MarchEntity.findOneBy({ id: march.id })

    let stopper = StopperEntity.create({
      march: marchEntity,
      user: UserController.loggedUser,
      seconds: time,
      from: from
    });
    return await stopper.save();
  },

  async updateStopper(stopper: IStopperEntity): Promise<IStopperEntity> {
    let existingStopper = await StopperEntity.findOneBy({ id: stopper.id });
    if (!existingStopper) {
      throw new Error("Stopper not found");
    }
    existingStopper.seconds = stopper.seconds;
    return await existingStopper.save();
  },
}
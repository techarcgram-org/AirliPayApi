import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mobile_money_access_control')
export class MobileMoneyAccessControl {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  orangeCollectionPersonalGoal: string;
  @Column()
  mtnCollectionPersonalGoal: string;
  @Column()
  orangeCollectionGroupGoal: string;
  @Column()
  mtnCollectionGroupGoal: string;
  @Column()
  mtnDisbursementFlip: string;
  @Column()
  orangeDisbursementFlip: string;
  @Column()
  mtnTopupFlip: string;
  @Column()
  orangeTopupFlip: string;
  @Column()
  mtnCollectionPersonalSaving: string;
  @Column()
  orangeCollectionPersonalSaving: string;
  @Column()
  mtnDisbursementPersonalSaving: string;
  @Column()
  orangeDisbursementPersonalSaving: string;
  @Column()
  orangeCollectionBasics: string;
  @Column()
  mtnCollectionBasics: string;
  @Column()
  groupSavingsCollectionMtn: string;
  @Column()
  groupSavingsCollectionOrange: string;
  @Column()
  pushCollectionMtn: string;
  @Column()
  pushCollectionOrange: string;
  @Column()
  flipCollectionOrange: string;
  @Column()
  flipCollectionMtn: string;
}

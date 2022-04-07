import {Column,PrimaryGeneratedColumn,Entity, CreateDateColumn, ManyToOne,UpdateDateColumn} from "typeorm"
import {author} from "./author.entity"
import {Field, ObjectType} from "type-graphql"
import { User } from "./user.entity"

@ObjectType()
@Entity()
export class Book{

    @Field()
    @PrimaryGeneratedColumn()
    id!:number

    @Field()
    @Column()
    title!:string

    @Field(()=>author)
    @ManyToOne(()=>author,author=>author.book,{onDelete:"CASCADE"})
    author!:author

    @Field(()=>User)
    @ManyToOne(()=>User,User=>User.book)
    user!:User

    @Field()
    @CreateDateColumn({type:'timestamp'})
    createAt!:Date

    @Field()
    @Column({type:'datetime'})
    lendedAt!:Date

    @Field()
    @Column({type:'datetime'})
    borrowedAt!:Date

    @Field()
    @Column()
    isAvailable!:boolean

}
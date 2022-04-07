import {Field, ObjectType} from "type-graphql"
import { Book } from "./book.entity"
import {Column,PrimaryGeneratedColumn,Entity,CreateDateColumn,OneToMany} from "typeorm"

@ObjectType()
@Entity()
export class User{

    @Field()
    @PrimaryGeneratedColumn()
    Id!:number

    @Field()
    @Column()
    fullName!:string

    @Field()
    @Column()
    email!:string

    @Field()
    @Column()
    password!:string

    @Field()
    @Column()
    state!:string

    @Field(()=>[Book]) // que no hace falta pasarlo 
    @OneToMany(()=>Book,Book=>Book.user) // columna que sera relacion con la tabla book, de una a muchos ya que un autor tiene muchos libros
    book!:Book[]

    @Field()
    @CreateDateColumn({type:"timestamp"})
    createAt!:Date

}



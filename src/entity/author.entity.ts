import {Column,PrimaryGeneratedColumn,Entity, CreateDateColumn, OneToMany} from "typeorm"
import {Book} from "./book.entity"
import {Field, ObjectType} from "type-graphql"


@ObjectType()
@Entity()
export class author {
    
    @Field()
    @PrimaryGeneratedColumn()
    id!:number

    @Field()
    @Column()
    fullname!:string

    @Field(()=>[Book]) // que no hace falta pasarlo 
    @OneToMany(()=>Book,Book=>Book.author,{nullable:true}) // columna que sera relacion con la tabla book, de una a muchos ya que un autor tiene muchos libros
    book!:Book[]

    @Field()
    @CreateDateColumn({type:"timestamp"})
    createAt!:Date
}
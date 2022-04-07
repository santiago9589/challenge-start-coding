import { Resolver, Query, Mutation, InputType, Field, Arg,UseMiddleware  } from "type-graphql"
import { author } from "../entity/author.entity" // importo la entidad author
import { Repository} from "typeorm"
import { IsInt,MinLength,MaxLength,Min} from "class-validator"
import{AppDataSource} from "../config/typeorm"
import {isAuth} from "../middlewares/authMiddlewares"




@InputType()
class AuthorInput {

    @Field()
    @MinLength(3)
    @MaxLength(20)
    fullname!: string

}

@InputType()
class NewAuthorInput {

    
    @Field()
    @IsInt()
    @Min(0) 
    id!: number

    @Field()
    @MinLength(3)
    @MaxLength(20)
    fullname?: string

}

@InputType()
class IdInput {

    
    @Field()
    @IsInt()
    @Min(0)
    id!: number

}


@Resolver()
export class AuthorResolver {

    authorReposity: Repository<author>

    constructor() {
        this.authorReposity = AppDataSource.getRepository(author) // habilita todos los metodos para interacturar conla bd
    }
    @Mutation(() => author) // la mutacion retornara una vez hecha, un valor del tipo author
    @UseMiddleware(isAuth)    
    async createAuthor(
        @Arg("input", () => AuthorInput) input: AuthorInput // el argumento pasado se llama input y el del tipo authorinput
    ): Promise<author | null> {
        try {
            const createdAuthor = await this.authorReposity.insert({ fullname: input.fullname }) // creo un nuevo datoe en la base y le paso el paremtro que llega del cliente, que seria fullname
            if(!createdAuthor){
                const error = new Error()
                error.message = "something wrong"
                throw error
            }
            const result = await this.authorReposity.findOne(createdAuthor.identifiers[0].id) // busco en la base de daatos el dato agregado ya que el metodoinsert no regresa un id sino un objeto con propiedades
            return result;
            
        } catch(error:any) {
            throw new Error(error)
        }
    }

    @Query(() => [author]) // la cosulta retornara un array de autores, se lo coloco tanto en el decorador como en la funcion
    @UseMiddleware(isAuth)
    async getAllAuthors(): Promise<author[] | undefined> {
        try {
            const arrayAuthors = await this.authorReposity.find({
                relations:{
                    book:true
            }, 
        })

        if(!arrayAuthors){
            const error = new Error()
            error.message = "not found"
            throw error
        }
            return arrayAuthors

        } catch(error:any) {
            throw new Error (error)
        }

    }

    @Query(() => author)
    @UseMiddleware(isAuth)
    async getOneAuthor(
        @Arg("input", () => IdInput) input: IdInput
    ): Promise<author | undefined> {
        try {
            const AuthorById = await this.authorReposity.findOneBy({
                id:input.id})
            if(!AuthorById){
                const error = new Error()
                error.message = "not found"
                throw error
            }
            return AuthorById
        } catch(error:any) {
            throw new Error(error)
        }

    }

    @Mutation(() => author)
    @UseMiddleware(isAuth)
    async updateOneAuthor(
        @Arg("input", () => NewAuthorInput) input: NewAuthorInput
    ): Promise<author | null> {

        try {
            const AuthorExist = await this.authorReposity.findOneBy({
                id:input.id})
            if (!AuthorExist) {
                const error = new Error()
                error.message = "not found"
                throw error
            }
            const NewAuthor = await this.authorReposity.save({
                id: input.id,
                fullname: input.fullname
            })

            const NewAuthorFull = await this.authorReposity.findOneBy({
                id:NewAuthor.id})

            return NewAuthorFull

        } catch(error:any) {
            throw new Error(error)
        }
    }


    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async DeleteAuthorById(
        @Arg("input", () => IdInput) input: IdInput
    ): Promise<String | undefined> {

        try {

            const AuthorExist = await this.authorReposity.findOneBy({
                id:input.id})

            if (!AuthorExist) {
                const error = new Error()
                error.message = "not found"
                throw error
            }

            await this.authorReposity.delete(input.id)

            return "Deleted"

        } catch(error:any) {
            throw new Error(error)
        }

    }


}
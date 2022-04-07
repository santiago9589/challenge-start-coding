import {Mutation,Query,Arg, InputType, Field, UseMiddleware} from "type-graphql"
import { Repository} from "typeorm"
import {User} from "../entity/user.entity"
import {Book} from "../entity/book.entity"
import {author} from "../entity/author.entity"
import {isAuth} from "../middlewares/authMiddlewares"
import { IsInt,MinLength,MaxLength,Min} from "class-validator"
import{AppDataSource} from "../config/typeorm"


@InputType()
class bookInput{
   
    @Field()
    @MinLength(3)
    @MaxLength(20)
    title!:string

    @Field()
    @IsInt()
    @Min(0)
    author!:number

}

@InputType()
class bookInputLend{
   

    @Field()
    @IsInt()
    @Min(0)
    id!:number

    @Field()
    @IsInt()
    @Min(0)
    idUser!:number

}

@InputType()
class bookInputId{
   
    @Field()
    @IsInt()
    @Min(0)
    id!:number

}

@InputType()
class bookInputUpdate{
   
    @Field()
    @MinLength(3)
    @MaxLength(20)
    title?:string

    @Field()
    @IsInt()
    @Min(0)
    author?: number


}

@InputType()
class bookInputParsedUpdate{
   
    @Field()
    @MinLength(3)
    @MaxLength(20)
    title?:string

    @Field()
    @MinLength(3)
    @MaxLength(20)
    author?: author


}


export class BookResolver {

    bookRepository:Repository<Book>
    authorReposity: Repository<author>
    userRepository:Repository<User>

    constructor(){
        this.bookRepository = AppDataSource.getRepository(Book)
        this.authorReposity = AppDataSource.getRepository(author)
        this.userRepository=AppDataSource.getRepository(User)
    }

@Mutation(()=>Book)
@UseMiddleware(isAuth)
async createBook(
    @Arg("input",()=>bookInput)input:bookInput
):Promise<Book|null>{
    try{
        const AuthorExist:author|null= await this.authorReposity.findOne({
            where: {id: input.author}
        })

        if(!AuthorExist){
            const error = new Error()
            error.message = "something wrong"
            throw error
        }
        const bookCreated:Book= await this.bookRepository.save({
            title:input.title,
            author:AuthorExist,
            isAvailable:true,
        })
        
        const result = await this.bookRepository.findOne({where:{id:bookCreated.id}}) // se le debe pasar un array con el nombre de las entidades con las que se realicona
        return result

    }catch(error:any){
        throw new Error(error)
    }
    
}


@Query(()=>[Book])
@UseMiddleware(isAuth)
async getAllBook():Promise<Book[]>{
    try{
       const allBook = await this.bookRepository.find({relations:{author:true}})

       if(!allBook){
        const error = new Error()
            error.message = "not found"
            throw error
       }
       const allBookAvailable = await allBook.filter((element)=>{
           if(element.isAvailable){
               return element
           }
       })

       return allBookAvailable
    }catch(error:any){
        throw new Error(error)
    }

}

@Query(()=>Book)
@UseMiddleware(isAuth)
async getBookById(
    @Arg("input",()=>bookInputId)input:bookInputId
):Promise<Book|undefined>{
    try{
        const getBook = await this.bookRepository.findOne({ 
            where :{id:input.id},

            relations: {
                author: true
            }
            
            })

        if(!getBook){
            const error = new Error()
            error.message = "not found"
            throw error
        }

        if(!getBook.isAvailable){
            const error = new Error()
            error.message = "book unavailable"
            throw error
        }
        return getBook
    }catch(error:any){
        throw new Error(error)
    }
}

@Mutation(()=>Boolean)
@UseMiddleware(isAuth)
async UpdateBookById(
    @Arg("inputId",()=>bookInputId)inputId:bookInputId,
    @Arg("input",()=>bookInputUpdate)input:bookInputUpdate
):Promise<Boolean>{
    try{
        await this.bookRepository.update(inputId.id,await this.parseInput(input)) // update necesita 2 parametros
        return true
    }catch(error:any){
        throw new Error(error)
    }
}

@Mutation(()=>Boolean)
@UseMiddleware(isAuth)
async deleteBookById(
    @Arg("inputId",()=>bookInputId)inputId:bookInputId,
):Promise<Boolean>{
    try{
        await this.bookRepository.delete(inputId.id)
        return true
    }catch(error:any){
        throw new Error(error)
    }
}

@Mutation(()=>String)
@UseMiddleware(isAuth)
async askBook (
    @Arg("input",()=>bookInputLend)input:bookInputLend
):Promise<String>{
    try{

        
        const {id,idUser} = input

        const bookExist = await this.bookRepository.findOne({ 
            where :{id:id},
            relations: {
                author: true,
                user:true
            }
            })

         const userExist = await this.userRepository.findOne({ 
            where :{Id:idUser},
            relations: {
                book: true
            }
            })

        if(!bookExist){
            const error = new Error()
            error.message="not found"
            throw error
        }

        if(!userExist){
            const error = new Error()
            error.message="not found"
            throw error
        }

        if(!bookExist.isAvailable || userExist.state!=="VERIFICADO" || userExist.book.length>3){
            const error = new Error()
            error.message = "book unavailable"
            throw error
        }

        bookExist.lendedAt=new Date(Date.now())
        bookExist.borrowedAt=await this.dateReturn(bookExist.lendedAt,7)
        bookExist.lendedAt=new Date(Date.now())
                
        bookExist.isAvailable = false
        userExist.book.push(bookExist)


        await this.bookRepository.save(bookExist)
        await this.userRepository.save(userExist)
        
        return "Libro pedido con exito"


    }catch(error:any){
        throw new Error(error)

    }

}

@Mutation(()=>String)
@UseMiddleware(isAuth)
async returnBook(
    @Arg("input",()=>bookInputLend)input:bookInputLend
):Promise<String>{

    const {id,idUser} = input
    const today = new Date(Date.now())

    const bookExist = await this.bookRepository.findOne({
        where:{id:id},
        relations:{
            author:true,
            user:true
        }
    })

    const userExist = await this.userRepository.findOne({ 
        where :{Id:idUser},
        relations: {
            book: true
        }
        })

        if(!bookExist || bookExist.isAvailable){
            const error = new Error()
            error.message="error"
            throw error
        }

        if(!userExist){
            const error = new Error()
            error.message="not found"
            throw error
        }
        
        
        bookExist.isAvailable = true
        const posDelete=userExist.book.indexOf(bookExist)
        userExist.book.splice(posDelete,1)


        if(today > bookExist.borrowedAt ){

            const days = this.daysOff(today,bookExist.borrowedAt)

            return ` Libro devuelto con exito, tiene que abonar ${days} de multa por atraso de entrega`
        }

        await this.bookRepository.save(bookExist)
        await this.userRepository.save(userExist)

        return "Libro devuelto con exito"

}

private async daysOff(inputT:Date,inputB:Date){ // funciona para restar fecha
    try{
        
        let daysFoul = inputT.getDate() - inputB.getDate()

        if(!daysFoul){
      
            const error = new Error()
            error.message = "error"
            throw error
        }

        
        return daysFoul
    
    }catch(error:any){

        throw new Error(error)

    }

}
private async dateReturn(input:Date,day:number){ // funciona para restar fecha
    try{
        
        input.setDate(input.getDate()+day)

        if(!input){
      
            const error = new Error()
            error.message = "not found"
            throw error
        }

        
        return input
    
    }catch(error:any){

        throw new Error(error)

    }
    
}













private async parseInput(input:bookInputUpdate){ // funciona para parsear el dato de author de numerico a string
    try{

        const _input:bookInputParsedUpdate = {}
    if(input.title){
        _input.title=input.title
    }
    if(input.author){
        const author = await this.authorReposity.findOneBy({
            id:input.author})
        if(!author){
            const error = new Error()
            error.message = "not found"
            throw error
        }
        _input.author = author
    }
    return _input

    }catch(error:any){

        throw new Error(error)

    }
    
}


}



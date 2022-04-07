import { compareSync, hash } from "bcryptjs"
import { decode, sign, verify } from "jsonwebtoken"
import { Resolver, Arg, Mutation, Query, InputType, Field, ObjectType } from "type-graphql"
import { Repository } from "typeorm"
import { User } from "../entity/user.entity"
import { IsEmail, MaxLength, MinLength } from "class-validator"
import { AppDataSource } from "../config/typeorm"
import { sendMailtoUser, sendMailtoRecover } from "../config/email"
import { getToken, getTokenData } from "../config/jwtoken"




@InputType()
class UserInput {

    @Field()
    @MinLength(3)
    @MaxLength(20)
    fullName!: string

    @Field()
    @IsEmail()
    email!: string

    @Field()
    @MinLength(3)
    @MaxLength(20)
    password!: string
}



@InputType()
class UserInputVerif {


    @Field()
    @IsEmail()
    email!: string

    @Field()
    jwt!: string


}

@InputType()
class UserInputRecover {


    @Field()
    @IsEmail()
    email!: string

    @Field()
    jwt!: string


    @Field()
    @MinLength(3)
    @MaxLength(20)
    password!: string


}


@ObjectType()
class LoginReponse {

    @Field()
    id!: number

    @Field()
    jwt!: string

}

@InputType()
class InputLogin {

    @Field()
    @IsEmail()
    email!: string

    @Field()
    @MinLength(3)
    @MaxLength(20)
    password!: string
}

@InputType()
class InputEmailRecover {

    @Field()
    @IsEmail()
    email!: string

}

@Resolver()
export class userResolver {

    authRepository: Repository<User> // creo la variable del tipo repositorio

    constructor() {
        this.authRepository = AppDataSource.getRepository(User)// creo el repositorio para poder interacturar con la base de datos
    }

    @Mutation(() => String)
    async Register(
        @Arg("input", () => UserInput) input: UserInput
    ): Promise<String | undefined> {

        try {

            const { email, fullName, password } = input

            // verifico si el mail existe en la base de datos

            const EmailExist = await this.authRepository.findOne({ where: { email } })
            if (EmailExist) {
                const error = new Error()
                error.message = "Email is unavailable"
                throw error
            }
            // se debe encrptar la contraseña del usuario
            const HasedPassword = await hash(password, 10)
            //una vez realizadas esas validaciones creo el usuario
            const jwtGenerate = await getToken(email)

            const newUser = {
                fullName: fullName,
                email: email,
                password: HasedPassword,
                jwt: jwtGenerate,
                state: "SIN VERIFICAR"
            }

            await this.authRepository.save({
                fullName: newUser.fullName,
                email: newUser.email,
                password: newUser.password,
                state: newUser.state
            })


            sendMailtoUser(newUser)

            return "User creado, debe verficarlo ingresado con el token enviado a su correo"

        } catch (error: any) {
            throw new Error(error)

        }
    }



    @Mutation(() => LoginReponse)
    async UserLogin(
        @Arg("input", () => InputLogin) input: InputLogin
    ): Promise<LoginReponse> {

        try {

            const { email, password } = input

            const UserExist = await this.authRepository.findOne({ where: { email } })
            if (!UserExist || UserExist.state !== "SIN VERIFICAR") {
                const error = new Error()
                error.message = "not found"
                throw error
            }

            const isValidPassword: boolean = compareSync(password, UserExist.password)

            if (!isValidPassword) {
                const error = new Error()
                error.message = "invalid credentials"
                throw error
            }

            const jwtGenerate: string = sign({ id: UserExist.Id }, "SecretKey")

            const LoginResult: LoginReponse = {
                id: UserExist.Id,
                jwt: jwtGenerate
            }

            return LoginResult

        } catch (error: any) {

            throw new Error(error)

        }

    }

    @Mutation(() => String)
    async verifyUser(
        @Arg("input", () => UserInputVerif) input: UserInputVerif
    ): Promise<String> {

        try {

            const data = await getTokenData(input.jwt)

            if (data === null) {
                const error = new Error()
                error.message = "invalid credentials"
                throw error
            }

            const { payload } = data

            if (payload !== input.email) {
                const error = new Error()
                error.message = "invalid credentials"
                throw error
            }

            const userExist = await this.authRepository.findOne({ where: { email: payload } })
            
            if (!userExist) {
                const error = new Error()
                error.message = "invalid credentials"
                throw error
            }

            userExist.state = "VERIFICADO"

            await this.authRepository.save(userExist)

            return "VERIFICADO"

        } catch (error: any) {
            throw new Error(error)
        }


    }

    @Mutation(() => String)
    async recoverUser(
        @Arg("input", () => UserInputRecover) input: UserInputRecover
    ): Promise<String> {

        try {

            const data = await getTokenData(input.jwt)

            if (data === null) {
                const error = new Error()
                error.message = "invalid credentials"
                throw error
            }

            const { payload } = data

            if (payload !== input.email) {
                const error = new Error()
                error.message = "invalid credentials"
                throw error
            }

            const userExist = await this.authRepository.findOne({ where: { email: payload } })

            if (!userExist) {
                const error = new Error()
                error.message = "invalid credentials"
                throw error
            }

            userExist.password = input.password

            await this.authRepository.save(userExist)

            return "USUARIO RECUPERADO"

        } catch (error: any) {
            throw new Error(error)
        }

    }

    @Mutation(() => String)
    async sendRequestToRecover(
        @Arg("input", () => InputEmailRecover) input: InputEmailRecover
    ): Promise<String> {

        try {

            const { email } = input


            const userExist = await this.authRepository.findOne({ where: { email } })

            if (!userExist) {
                const error = new Error()
                error.message = "invalid credentials"
                throw error
            }

            const jwt = getToken(email)

            const userMailToRecover = {
                email: email,
                jwt: jwt
            }

            sendMailtoUser(userMailToRecover)


            return "Email enviado a su casilla de correo"

        } catch (error: any) {
            throw new Error(error);

        }


    }

    @Query(() => [User])
    async getAllUser(): Promise<User[]> {
        try {

            const usersExist = await this.authRepository.find({
                relations: {
                    book: true
                }
            })

            if (!usersExist) {
                const error = new Error()
                error.message = "not found"
                throw error
            }

            return usersExist

        } catch (error: any) {

            throw new Error(error)

        }


    }

    

}


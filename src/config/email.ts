import { createTransport } from "nodemailer"



class UserInputVerif {

   
    email!: string


   
    jwt!: string
}


export const createTrans = () => { // creo el transportador, le dices a nodemailer quiero usar este tipo de conexion
    const transport = createTransport({ // son datos sacados de mailtrap que hace de servidor de mail
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "ef4ef2dd429da7",
            pass: "a43d5f638f1dd5"
        }
    })

    return transport // retorna la conexion 
}


export const sendMailtoUser = async (user: UserInputVerif) => {

    try {
        const transport = createTrans() // creo la conexion
        const email = await transport.sendMail({ // el transportador envia el mail  con los datos entre las llaves

            from: "noreply <san@foo.com>",
            to: `${user.email}`,
            subject: "welcome suscribete",
            html: `<b> Bienveido a nuestra socidad
            para verificar tu usuario usa el siguiente token
            ${user.jwt}  genere una mutacion verifyUser, la cual debe ingresar el email y el token obtenido<br>`,

        })
        if (!email) {
            const error = new Error()
            error.message = "not found"
            throw error
        }
        console.log("mensaje enviado")

        return


    } catch (error:any) {
        throw new Error(error)
    }

}

export const sendMailtoRecover = async (user: UserInputVerif) => {

    try {
        const transport = createTrans() // creo la conexion
        const email = await transport.sendMail({ // el transportador envia el mail  con los datos entre las llaves

            from: "noreply <san@foo.com>",
            to: `${user.email}`,
            subject: "welcome suscribete",
            html: `<b> Bienveido a nuestra socidad
            para recupetar tu usuario usa el siguiente token
            ${user.jwt} genere una mutacion recoverUser, la cual debe ingresar el email y el token obtenido<br>`,

        })
        if (!email) {
            const error = new Error()
            error.message = "not found"
            throw error
        }
        console.log("mensaje enviado")

        return


    } catch (error:any) {
        throw new Error(error)
    }

}



// conexion smtp


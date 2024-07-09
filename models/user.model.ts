import mongoose, { Document, Model, Schema } from "mongoose"
import bcrypt from 'bcryptjs'


const emailRegexPattern: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string
    };
    role: {
        type: string;
        isVerified: boolean;
        courses: Array<{ courseId: string }>;
        comparePassword: (password: string) => Promise<boolean>;


    }


}

const userSchema: Schema<IUser> = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'kindly enter a name']
    },
    email: {
        type: String,
        required: [true, 'please enter your email'],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value)
            },
            message: 'please enter a valid email'
        },
        unique: true,

    },
    password: {
        type: String,
        required: [true, "please enter your password"],
        minLength: [8, "password must be at least 6 characters"],
        select: false,

    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    courses: [
        {
            courseId: String,
        }
    ],


},
    {
        timestamps: true
    });


// hash passkey

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//compare pass
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}

const userModel: Model<IUser> = mongoose.model("User", userSchema)

export default userModel;
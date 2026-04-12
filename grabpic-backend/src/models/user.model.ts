import bcrypt from "bcrypt"
import { Schema, model, Document } from 'mongoose';
import { randomUUID } from "crypto";

interface IUser extends Document {
    email: string
    password?: string
    googleId?: string
    name: string
    faceId?: string
    profilePhoto?: string
    faceRegistered: boolean
    refreshToken?: string
    comparePassword: (candidatePassword: string) => Promise<boolean>
}

const UserSchema: Schema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String }, 
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  faceId: { type: String, unique: true, sparse: true }, 
  profilePhoto: { type: String },
  faceRegistered: { type: Boolean, default: false },
  refreshToken: { type: String },
}, {timestamps: true});


UserSchema.pre("save", async function () {
    const user = this as unknown as IUser;

    if (!user.isModified("password") || !user.password) return;

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
})

UserSchema.pre("save", async function () {
    const user = this as unknown as IUser;

    if (!user.faceId) {
        user.faceId = randomUUID();
    }
})

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password)
}

export const User = model<IUser>('User', UserSchema);
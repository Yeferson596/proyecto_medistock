import { dbResult, getCollection } from '../../shared/db';
import { enqueueOracleSync } from '../../shared/oracle-sync';
import type { User } from '../../shared/types';

type UserDocument = User & { password?: string };
const users = () => getCollection<UserDocument>('users');
const publicProjection = { _id: 0, password: 0 };

export const getAllUsers = async () => {
  const rows = await users().find({}, { projection: publicProjection }).sort({ name: 1 }).toArray();
  return dbResult(rows);
};

export const getUserById = async (id: string) => {
  const user = await users().findOne({ id }, { projection: publicProjection });
  return dbResult(user ? [user] : []);
};

export const createUser = async (user: User & { passwordHash?: string }) => {
  const document: UserDocument = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.institution ? { institution: user.institution } : {}),
    ...(user.passwordHash ? { password: user.passwordHash } : {})
  };
  await users().insertOne(document);
  await enqueueOracleSync('users', document.id);
  const { password: _password, ...publicUser } = document;
  return dbResult<User>([publicUser]);
};

export const updateUser = async (id: string, user: Partial<User>) => {
  const fields = Object.fromEntries(
    Object.entries(user).filter(([, value]) => value !== undefined)
  );
  const updated = await users().findOneAndUpdate(
    { id },
    { $set: fields },
    { returnDocument: 'after', projection: publicProjection }
  );
  if (updated) await enqueueOracleSync('users', id);
  return dbResult(updated ? [updated] : []);
};

export const deleteUser = async (id: string) => {
  const deleted = await users().findOneAndDelete({ id }, { projection: publicProjection });
  if (deleted) await enqueueOracleSync('users', id);
  return dbResult(deleted ? [deleted] : []);
};

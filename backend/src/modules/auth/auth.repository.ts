import { dbResult, getCollection } from '../../shared/db';
import { enqueueOracleSync } from '../../shared/oracle-sync';
import type { User } from '../../shared/types';

type UserDocument = User & { password: string };
const users = () => getCollection<UserDocument>('users');

export const getUserByEmail = async (email: string) => {
  const user = await users().findOne({ email }, { projection: { _id: 0 } });
  return dbResult(user ? [user] : []);
};

export const createUser = async (user: User & { passwordHash: string }) => {
  const { passwordHash, ...publicUser } = user;
  const document: UserDocument = { ...publicUser, password: passwordHash };
  await users().insertOne(document);
  await enqueueOracleSync('users', document.id);
  return dbResult<User>([publicUser]);
};

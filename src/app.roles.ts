import { RolesBuilder } from 'nest-access-control';

export enum AppRoles {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  AUTHOR = 'AUTHOR',
}

export const roles: RolesBuilder = new RolesBuilder();

roles
  .grant(AppRoles.AUTHOR) // AUTHOR có quyền CRUD bài viết của chính mình
  .createOwn('article')
  .readOwn('article')
  .updateOwn('article')
  .grant(AppRoles.EDITOR) // EDITOR kế thừa AUTHOR và thêm quyền sửa bài của người khác
  .extend(AppRoles.AUTHOR)
  .readAny('article')
  .updateAny('article')
  .grant(AppRoles.ADMIN) // ADMIN có mọi quyền trên bất kỳ resource nào
  .extend(AppRoles.EDITOR)
  .createAny('user')
  .readAny('user')
  .updateAny('user')
  .deleteAny('user');

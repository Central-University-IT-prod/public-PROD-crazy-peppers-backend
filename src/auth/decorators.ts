import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_ADMIN_KEY = 'isAdmin';
export const PublicRoute = () => SetMetadata(IS_PUBLIC_KEY, true);
export const AdminRoute = () => SetMetadata(IS_ADMIN_KEY, true);

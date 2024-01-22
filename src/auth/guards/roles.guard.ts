import { UserService } from 'src/user/user.service';
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "src/common/types/userRoles.type";



@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate
{

  constructor(private reflector: Reflector,
    private readonly userService: UserService
  )
  {
    super();
  }

  async canActivate(context: ExecutionContext)
  {
    const { user } = context.switchToHttp().getRequest();
    const getUser = await this.userService.findUserIdByUser(user.id);

    const userRole = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])
    if (!userRole)
    {
      return false;
    }
    const role = userRole.some((role) => user.role >= role)
    return role
  }
}
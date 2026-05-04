# NestJS Code Review Rules

## Critical Rules
- Missing `@Injectable()` decorator on service class
- Circular dependency without `forwardRef()`
- Missing guards on sensitive endpoints → use `@UseGuards()`
- Raw SQL without parameterization in repositories

## Warning Rules
- Missing DTO validation → use `class-validator` decorators
- Missing `@ApiTags()` / `@ApiOperation()` for Swagger docs
- Injecting repository directly in controller → use service layer
- Missing `@Transactional()` on multi-step database operations

## Suggestions
- Use `ConfigService` instead of `process.env` directly
- Use custom exceptions extending `HttpException`
- Use interceptors for response transformation
- Use pipes for input transformation

## Detection Patterns

```typescript
// CRITICAL: Missing Injectable
class UserService {  // should be @Injectable()
  constructor(private repo: UserRepository) {}
}

// WARNING: Missing validation
@Post()
create(@Body() dto: CreateUserDto) {}  // dto needs class-validator decorators

// CRITICAL: Circular dependency
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {}  // if B also injects A
}

// SECURE: Forward ref
constructor(@Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB) {}
```

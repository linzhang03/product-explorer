import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';


class MockAuth extends AuthService { override isAdmin() { return this._val; } private _val=false; set(v:boolean){(this as any)._val=v;} }


describe('AdminGuard', () => {
let guard: AdminGuard;
let auth: MockAuth;
let router: Router;


beforeEach(() => {
TestBed.configureTestingModule({ providers: [ AdminGuard, { provide: AuthService, useClass: MockAuth }, { provide: Router, useValue: { parseUrl: (u:string)=>({} as any) } } ] });
guard = TestBed.inject(AdminGuard);
auth = TestBed.inject(AuthService) as any;
router = TestBed.inject(Router);
});


it('allows when admin', () => {
	auth.set(true);
	const res = guard.canActivate({} as any, {} as any);
	expect(res).toBeTrue();
});


it('blocks when not admin', () => {
	auth.set(false);
	const res = guard.canActivate({} as any, {} as any);
	expect(res).not.toBeTrue();
});
});
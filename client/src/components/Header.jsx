import { UserMenu } from './UserMenu';

export function Header() {
  return (
    <div className="CalorieCounter-header relative w-full flex justify-center items-center">
      <h1 className="text-2xl mb-4 md:mb-0">Contador de Calorías</h1>
      <div className="absolute right-4 top-4">
        <UserMenu />
      </div>
    </div>
  );
}

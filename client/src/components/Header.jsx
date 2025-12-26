import { UserMenu } from './UserMenu';

export function Header() {
  return (
    <div className="CalorieCounter-header flex justify-between items-center">
      <h1 className="text-2xl mb-4 md:mb-0">Contador de Calorías</h1>
      <UserMenu />
    </div>
  );
}

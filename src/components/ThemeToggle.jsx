import { Dropdown, DropdownItem } from 'flowbite-react';
import { HiOutlineSun, HiOutlineMoon, HiOutlineComputerDesktop } from 'react-icons/hi2';
import { useAppTheme } from '../context/ThemeContext';

const OPTIONS = [
  { value: 'light', label: 'Claro', icon: HiOutlineSun },
  { value: 'dark', label: 'Escuro', icon: HiOutlineMoon },
  { value: 'system', label: 'Sistema', icon: HiOutlineComputerDesktop },
];

// Três opções, não um switch de dois estados — deixa "seguir o sistema"
// como uma escolha explícita em vez de ser só o que acontece se você não
// mexer em nada.
export default function ThemeToggle() {
  const { preference, setThemePreference } = useAppTheme();
  const current = OPTIONS.find((o) => o.value === preference) ?? OPTIONS[2];
  const CurrentIcon = current.icon;

  return (
    <Dropdown
      inline
      arrowIcon={false}
      placement="bottom-end"
      label={<CurrentIcon className="h-5 w-5 text-text-soft hover:text-text" />}
    >
      {OPTIONS.map((option) => (
        <DropdownItem
          key={option.value}
          icon={option.icon}
          onClick={() => setThemePreference(option.value)}
          className={option.value === preference ? 'font-semibold text-primary' : undefined}
        >
          {option.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

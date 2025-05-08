import LanguageSwitcher from "../ui/language-switcher";
import ThemeSwitcher from "../ui/theme-switcher";

const TopBar = () => {
  return (
    <div className="flex w-full flex-row justify-between border-b p-2">
      <div className="flex flex-row gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default TopBar;

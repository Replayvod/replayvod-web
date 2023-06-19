import React from "react";
import { useTranslation } from "react-i18next";

const Manage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:ml-64">
      <div className="p-4 mt-14">
        <h1 className="text-3xl font-bold pb-5 dark:text-stone-100">{t("Manage")}</h1>
      </div>
    </div>
  );
};

export default Manage;
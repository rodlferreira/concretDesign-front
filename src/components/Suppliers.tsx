import { useI18n } from "../i18n/I18n";
import { suppliers } from "../lib/suppliers";

export function Suppliers() {
  const { t } = useI18n();
  return (
    <section
      className="suppliers section-pad"
      id="fornecedores"
      aria-labelledby="suppliers-title"
    >
      <div>
        <h2 id="suppliers-title">{t("suppliers.title")}</h2>
        <p>{t("materials.text")}</p>
      </div>
      <div className="suppliers-content">
        <ul className="suppliers-list">
          {suppliers.map((supplier) => (
            <li key={supplier.name}>
              <a
                className="supplier-mark"
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className={`supplier-logo-circle${supplier.logoBackground === "dark" ? " supplier-logo-circle--dark" : ""}`}
                >
                  <img
                    src={supplier.logo}
                    alt=""
                    width="110"
                    height="76"
                    loading="lazy"
                  />
                </span>
                <span>{supplier.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Impressum() {
  return (
    <div className="mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
        <div className="flex-1">
          <img
            decoding="async"
            src="https://datasmartpoint.com/wp-content/uploads/elementor/thumbs/pexels-cottonbro-3205567-scaled-r29mjavy4qj0s2fjasxlh3ekqclwkevrc42uhbgrqo.avif"
            alt="pexels-cottonbro-3205567"
            className="rounded-xl shadow-lg w-full h-auto object-cover"
          />
        </div>
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center mb-2">
            <div className="w-1 h-8 bg-dsp-orange mr-3 rounded" />
            <h3 className="text-xl text-gray-500">Rechtliche Informationen</h3>
          </div>
          <h1 className="text-4xl font-bold mb-4">Impressum</h1>
          <p className="text-gray-700 leading-relaxed">
            Alle wichtigen Angaben auf einen Blick. Hier findest du die
            gesetzlichen Pflichtangaben zu unserem Unternehmen, einschließlich
            Kontaktinformationen und Verantwortlichkeiten.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-8 ">
        <section className="bg-gray-50 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-dsp-orange mr-3 rounded"></div>
            <h3 className="font-semibold">Anbieter dieser Seite ist:</h3>
          </div>
          <p className="mb-2 font-medium">DataSmart Point GmbH</p>
          <p className="mb-2">
            Anschrift:
            <br />
            Knesebeckstr. 62/63
            <br />
            10719 Berlin
            <br />
            Deutschland
          </p>
          <p className="mb-2">
            Kontakt:{" "}
            <a
              href="mailto:info.contact@datasmartpoint.de"
              className="text-dsp-orange underline"
            >
              info.contact@datasmartpoint.de
            </a>
            <br />
            030-16634387
          </p>
          <p className="mb-2">
            Eingetragen bei: Amtsgericht Berlin (Charlottenburg), Deutschland
            <br />
            Register-ID: HRB 251575
          </p>
          <p className="mb-2">
            Rechtlicher Hinweis: Alle Rechte an den Inhalten dieser Website sind
            vorbehalten. Jede kommerzielle Nutzung bedarf der vorherigen
            Zustimmung des Rechteinhabers. Diese Website kann Links zu Websites
            Dritter enthalten. Eine Haftung für die Inhalte dieser Links können
            wir nicht übernehmen.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4">Urheberrecht</h3>
          <p className="leading-relaxed">
            Die Inhalte und Werke auf dieser Website unterliegen dem deutschen
            Urheberrecht. Jegliche Vervielfältigung, Bearbeitung, Verbreitung
            oder Verwertung außerhalb der Grenzen des Urheberrechts bedarf der
            schriftlichen Zustimmung des Autors oder Erstellers. Das
            Herunterladen und Kopieren der Seite ist nur für den privaten, nicht
            kommerziellen Gebrauch erlaubt. Wenn Inhalte von Dritten verwendet
            werden, werden deren Urheberrechte beachtet. Falls Sie auf eine
            Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
            Hinweis. Wir entfernen die Inhalte dann umgehend.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Impressum;

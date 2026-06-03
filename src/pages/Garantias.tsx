import { useEffect, useMemo, useState } from "react";
import { Download, FileSearch, ShieldCheck } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const WARRANTIES_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1UPn9KUe-0qJzVsmI_HrZM-Vq4e8LWoXyP4AZGDvHItw/export?format=csv&gid=0";

type WarrantyRow = Record<string, string>;

const normalize = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCsv = (csv: string): WarrantyRow[] => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = parseCsvLine(lines[0] || "").map((header, index) => header || `Campo ${index + 1}`);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<WarrantyRow>((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
};

const findInvoiceColumn = (rows: WarrantyRow[]) => {
  const headers = Object.keys(rows[0] || {});
  return (
    headers.find((header) => {
      const normalized = normalize(header);
      return normalized.includes("FACTURA") || normalized.includes("DOCUMENTO") || normalized.includes("COMPROBANTE");
    }) || headers[0] || ""
  );
};

const getValueByAliases = (row: WarrantyRow, aliases: string[]) => {
  const entries = Object.entries(row);
  const found = entries.find(([key]) => {
    const normalizedKey = normalize(key);
    return aliases.some((alias) => normalizedKey.includes(normalize(alias)));
  });

  return found?.[1]?.trim() || "";
};

const buildWarrantyMessage = (rows: WarrantyRow[], invoiceNumber: string) => {
  const first = rows[0] || {};
  const client = getValueByAliases(first, ["cliente", "razon", "nombre"]);
  const product = getValueByAliases(first, ["producto", "descripcion", "item", "articulo"]);
  const status = getValueByAliases(first, ["estado", "situacion"]);
  const warranty = getValueByAliases(first, ["garantia", "cobertura", "vigencia"]);
  const date = getValueByAliases(first, ["fecha"]);

  const parts = [
    client ? `Estimado/a ${client},` : "Estimado/a cliente,",
    `con mucho gusto hemos encontrado información asociada a la factura ${invoiceNumber}.`,
    product ? `El producto registrado es ${product}.` : "A continuación se muestran los datos registrados en nuestro sistema.",
    date ? `La fecha relacionada al registro es ${date}.` : "",
    warranty ? `La información de garantía registrada indica: ${warranty}.` : "",
    status ? `El estado actual figura como: ${status}.` : "",
    "Le recomendamos revisar cuidadosamente los datos mostrados y conservar este comprobante para cualquier gestión posterior. Gracias por confiar en Distribuidor Punto PAS.",
  ];

  return parts.filter(Boolean).join(" ");
};

const downloadWarrantyPdf = (invoiceNumber: string, rows: WarrantyRow[]) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const headers = Object.keys(rows[0] || {});
  const tableRows = rows.flatMap((row, rowIndex) => [
    [{ content: `Registro ${rowIndex + 1}`, colSpan: 2, styles: { fillColor: [250, 0, 63], textColor: 255, fontStyle: "bold" } }],
    ...headers.map((header) => [header, row[header] || "-"]),
  ]);

  doc.setFillColor(250, 0, 63);
  doc.rect(0, 0, pageWidth, 86, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text("Certificado de Garantia", 42, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Distribuidor Punto PAS", 42, 58);
  doc.text(`Factura: ${invoiceNumber}`, 42, 74);

  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Informacion registrada para gestion de garantia", 42, 116);

  autoTable(doc, {
    startY: 136,
    head: [["Variable", "Detalle"]],
    body: tableRows,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 6, overflow: "linebreak" },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 170, fontStyle: "bold", textColor: [31, 41, 55] },
      1: { cellWidth: 330 },
    },
    margin: { left: 42, right: 42 },
  });

  doc.setProperties({
    title: `Garantia ${invoiceNumber}`,
    subject: "Datos de garantia",
    author: "Distribuidor Punto PAS",
  });
  doc.save(`garantia-${invoiceNumber}.pdf`);
};

const Garantias = () => {
  const [cartCount, setCartCount] = useState(0);
  const [rows, setRows] = useState<WarrantyRow[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [searchedInvoice, setSearchedInvoice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cartRaw = localStorage.getItem("puntopas_cart");
    const cart = cartRaw ? JSON.parse(cartRaw) : [];
    const count = cart.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
    setCartCount(count);
  }, []);

  useEffect(() => {
    const loadWarranties = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(WARRANTIES_SHEET_CSV_URL);
        if (!response.ok) throw new Error("No se pudo leer la hoja de garantias.");
        const csv = await response.text();
        setRows(parseCsv(csv));
      } catch {
        setError("No pudimos cargar la información de garantías en este momento. Por favor, inténtelo nuevamente en unos minutos.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadWarranties();
  }, []);

  const invoiceColumn = useMemo(() => findInvoiceColumn(rows), [rows]);
  const matchedRows = useMemo(() => {
    const normalizedSearch = normalize(searchedInvoice);
    if (!normalizedSearch || !invoiceColumn) return [];
    return rows.filter((row) => normalize(row[invoiceColumn]) === normalizedSearch);
  }, [invoiceColumn, rows, searchedInvoice]);

  const displayHeaders = Object.keys(matchedRows[0] || {});
  const message = matchedRows.length > 0 ? buildWarrantyMessage(matchedRows, searchedInvoice) : "";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchedInvoice(invoiceNumber.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header cartCount={cartCount} onSearch={() => {}} onCartClick={() => { window.location.href = "/checkout"; }} />

      <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <section className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,0.45)]">
          <div className="bg-gradient-to-r from-[#ff0000] to-[#FA003F] px-6 py-8 text-white md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Servicio al cliente</p>
                <h1 className="mt-2 text-3xl font-black md:text-5xl">Garantías</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 md:text-base">
                  Consulte con su número de factura la información registrada para su garantía.
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <ShieldCheck className="h-9 w-9" />
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
              <label htmlFor="invoice-search" className="text-sm font-bold text-slate-800">
                Número de factura
              </label>
              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <FileSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="invoice-search"
                    value={invoiceNumber}
                    onChange={(event) => setInvoiceNumber(event.target.value)}
                    placeholder="Ingrese el número de factura"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none ring-[#FA003F]/20 transition focus:border-[#FA003F] focus:ring-4"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || invoiceNumber.trim().length === 0}
                  className="h-12 rounded-xl bg-[#ff0000] px-6 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Buscar garantía
                </button>
              </div>
            </form>

            {isLoading && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                Cargando información de garantías...
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {!isLoading && searchedInvoice && matchedRows.length === 0 && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                Estimado/a cliente, no encontramos una garantía registrada con la factura {searchedInvoice}. Por favor, revise que el número esté escrito correctamente o comuníquese con nuestro equipo para ayudarle con mucho gusto.
              </div>
            )}

            {matchedRows.length > 0 && (
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-7 text-emerald-900">
                  {message}
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-black text-slate-900">Datos de la garantía</h2>
                  <button
                    onClick={() => downloadWarrantyPdf(searchedInvoice, matchedRows)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-950 text-white">
                        <tr>
                          {displayHeaders.map((header) => (
                            <th key={header} className="px-4 py-3 text-left font-bold">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {matchedRows.map((row, rowIndex) => (
                          <tr key={`${searchedInvoice}-${rowIndex}`} className="odd:bg-white even:bg-slate-50">
                            {displayHeaders.map((header) => (
                              <td key={`${rowIndex}-${header}`} className="px-4 py-3 text-slate-700">
                                {row[header] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Garantias;

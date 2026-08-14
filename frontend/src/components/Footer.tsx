const SERVICES = [
  { name: 'eureka-naming-server', port: '8761', role: 'registry' },
  { name: 'product-service', port: '8100 · 8101', role: 'menu, two copies' },
  { name: 'order-service', port: '8200', role: 'writes orders, publishes' },
  { name: 'notification-service', port: '8300', role: 'consumes orders' },
  { name: 'user-service', port: '8400', role: 'accounts' },
]

/**
 * The service map, stated plainly. The rail at the top shows an order moving;
 * this says what the pieces are and where they listen — which is the first
 * thing anyone running this locally needs to know.
 */
export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-8">
        <p className="eyebrow">what is running</p>

        <ul className="mt-5 divide-y divide-line border-y border-line">
          {SERVICES.map((service) => (
            <li key={service.name} className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-2.5">
              <span className="font-mono text-data text-ink">{service.name}</span>
              <span className="text-micro text-moss">{service.role}</span>
              <span data-value className="ml-auto text-micro text-moss">
                :{service.port}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-lg font-extrabold tracking-[-0.04em] text-ink">DOI</span>
            <span lang="th" className="text-sm text-moss">
              ดอย
            </span>
          </p>
          <p className="font-mono text-micro leading-relaxed text-moss">
            Front end for the simple-order-system microservices · Mae Fah Luang University
          </p>
        </div>
      </div>
    </footer>
  )
}

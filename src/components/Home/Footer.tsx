import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const navigation = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'Flights', href: '/flights' },
      { name: 'Cars', href: '/cars' },
      { name: 'Combo', href: '/combo' },
      { name: 'Hotels', href: '/hotels' },
    ],
    other: [
      { name: 'Special Offer', href: '/special-offer' },
      { name: 'Travel Tools', href: '/tools' },
    ]
  }

  const paymentMethods = [
    'visa.png',
    'mastercard.png',
    'unknown.png',
    'paypal.png',
    'americanexpress.png',
    'discover.png',
    'apple.png',
  ]

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Navigation Section */}
          <nav>
            <ul className="space-y-2">
              {navigation.main.map((item, index) => (
                <li key={item.name}>
                  {index === 0 ? (
                    <a href={item.href} className="text-gray-300 hover:text-white text-lg font-semibold mb-4">
                      {item.name}
                    </a>
                  ) : (
                    <a href={item.href} className="text-gray-300 hover:text-white text-sm">
                      {item.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Other Links Section */}
          <nav>
            <h3 className="text-lg font-semibold mb-4">Special Offer</h3>
            <ul className="space-y-2">
              {navigation.other.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-gray-300 hover:text-white text-sm">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:booktrip@cititravel.com" 
                  className="flex items-center gap-2 text-gray-300 text-sm hover:text-white"
                >
                  <Mail className="w-4 h-4" />
                  <span>booktrip@cititravel.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:2125641132" 
                  className="flex items-center gap-2 text-gray-300 text-sm hover:text-white"
                >
                  <Phone className="w-4 h-4" />
                  <span>212 564 1132</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <address className="not-italic">
                  99 Jericho Turnpike Jericho NY 11753
                </address>
              </li>
            </ul>
          </section>

          {/* Payment Methods Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="flex flex-wrap gap-4">
              {paymentMethods.map((method) => (
                <img
                  key={method}
                  src={`/payment/${method}`}
                  alt={method.split('.')[0]}
                  className="h-8 object-contain"
                />
              ))}
            </div>
          </section>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CitiTravel.com, All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
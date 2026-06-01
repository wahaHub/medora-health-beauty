import React from 'react';
import { Link } from 'react-router-dom';

const PatientForm: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 to-navy-900/50"></div>
        </div>

        <div className="relative z-10 text-center text-white px-6">
          <h1 className="font-serif text-5xl md:text-7xl mb-4 font-light">
            Patient Form
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto">
            Complete your forms before your consultation
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">

          {/* Introduction */}
          <div className="mb-16">
            <p className="text-stone-600 font-light leading-relaxed text-lg mb-6">
              Please complete the following form prior to your consultation and bring it to your appointment.
              We ask that you also bring a form of ID, such as your driver's license and your insurance card.
            </p>
          </div>

          {/* Patient Demographic Sheet */}
          <div className="mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-6">
              Patient Demographic Sheet
            </h2>
            <p className="text-stone-600 font-light leading-relaxed mb-6">
              You have the option of completing your patient demographic sheet electronically. If you would like
              to utilize the electronic patient demographic sheet, please complete the form using the button below
              and then submit it. You will not need to print anything out.
            </p>
            <div className="bg-sage-50 border border-sage-200 p-8 rounded-sm mb-8">
              <a
                href="https://portal.athenahealth.com/675958/registration/index.html?practiceid=675958"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold-600 text-white px-8 py-4 hover:bg-gold-700 transition-colors duration-300 font-medium tracking-wide uppercase"
              >
                Complete Electronic Demographic Sheet
              </a>
            </div>
            <p className="text-stone-600 font-light leading-relaxed mb-4">
              If you would prefer to complete your patient demographic sheet at home, please{' '}
              <a
                href="/pdf/Patient_Demographic_Sheet.pdf"
                className="text-navy-900 font-semibold hover:text-gold-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                download the document here
              </a>
              , complete it, and bring it with you to your appointment.
            </p>
          </div>

          {/* Health Care Plan Participation */}
          <div className="mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-6">
              Health Care Plan Participation, Hospital Affiliations and Laboratory Affiliations
            </h2>
            <p className="text-stone-600 font-light leading-relaxed mb-4">
              Please{' '}
              <a
                href="/pdf/health_plan_participation.pdf"
                className="text-navy-900 font-semibold hover:text-gold-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                download this document
              </a>
              {' '}for details on health care plan participation, hospital affiliations, and laboratory affiliations.
            </p>
          </div>

          {/* Virtual Visits */}
          <div className="mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-6">
              Virtual Visits
            </h2>
            <p className="text-stone-600 font-light leading-relaxed mb-4">
              If you are having a virtual visit with us, please{' '}
              <a
                href="/pdf/Patient_Consent_Form_for_Virtual_Visits.pdf"
                className="text-navy-900 font-semibold hover:text-gold-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                download and sign this consent form
              </a>
              .
            </p>
          </div>

          {/* Patient Guidebook */}
          <div className="mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-6">
              Patient Guidebook
            </h2>
            <p className="text-stone-600 font-light leading-relaxed mb-6">
              We encourage you to{' '}
              <a
                href="/pdf/Patient_Guidebook.pdf"
                className="text-navy-900 font-semibold hover:text-gold-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                download and read our Patient Guidebook
              </a>
              . This comprehensive resource provides important information about our practice, procedures,
              and what to expect during your journey with us.
            </p>
          </div>

          {/* Privacy Section */}
          <div className="mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-6">
              Privacy
            </h2>
            <p className="text-stone-600 font-light leading-relaxed mb-4">
              We value your privacy and understand that discretion is important to our patients. Our facility
              features a private entrance and an isolated waiting area to ensure your comfort and confidentiality
              during your visit.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-sage-50 border border-sage-200 p-10 rounded-sm">
            <h3 className="font-serif text-2xl text-navy-900 mb-6 text-center">
              Questions?
            </h3>
            <p className="text-stone-600 font-light leading-relaxed text-center mb-6">
              If you have any questions about completing your patient forms or need assistance,
              please don't hesitate to contact us.
            </p>
            <div className="text-center mb-6">
              <a
                href="tel:585-523-2925"
                className="text-2xl font-semibold text-navy-900 hover:text-gold-600 transition-colors"
              >
                (585) 523-2925
              </a>
            </div>
            <div className="text-center">
              <Link
                to="/travel#directions"
                className="inline-block text-navy-900 font-semibold hover:text-gold-600 underline"
              >
                Get Directions to Our Office
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PatientForm;

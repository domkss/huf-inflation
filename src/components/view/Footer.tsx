import React from "react";

function Footer() {
  return (
    <footer className='py-4'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
          <div className='text-sm text-center md:text-left'>
            <p>
              Az oldalon található adatok kizárólag tájékoztató jellegűek. Mindent megteszünk a pontosság érdekében, de
              nem vállalunk felelősséget az esetleges hibákért vagy elavult információkért.
            </p>
            <p className='mt-2'>
              <span className='font-semibold'>Források:</span> allampapir.hu (AKK), frankfurter.app (ECB)
            </p>
            <p className='mt-2'>
              <span className='font-semibold'>Nem befektetési tanácsadás:</span> Az itt megjelenített információk nem
              minősülnek befektetési tanácsadásnak vagy ajánlásnak. Minden befektetési döntés saját felelősségre
              történik.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

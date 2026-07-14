import React from 'react';
import CookDirectory from '../components/CookDirectory';

const Home = () => {
  return (
    <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
      <section className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-sm sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-600">Fresh from local kitchens</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Discover trusted home chefs and wholesome meals near you.</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">Browse curated kitchens, filter by cuisine and price, and order meals that fit your schedule and taste.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700">Verified kitchens</span>
          <span className="rounded-full bg-orange-50 px-3 py-1.5 font-medium text-orange-700">Fast delivery</span>
          <span className="rounded-full bg-sky-50 px-3 py-1.5 font-medium text-sky-700">Easy ordering</span>
        </div>
      </section>
      <CookDirectory />
    </div>
  );
};

export default Home;
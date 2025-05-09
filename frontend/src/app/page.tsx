import dynamic from 'next/dynamic';

const Page = dynamic(() => import('./PageClient'), { ssr: false });
export default Page; 
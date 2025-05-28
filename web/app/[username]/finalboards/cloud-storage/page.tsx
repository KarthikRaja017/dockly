import dynamic from 'next/dynamic';

const FilesStorage = dynamic(() => import('../../../../pages/finalboards/cloud-storage/filesStorage'), { ssr: false });

const FilesStoragePage = () => {
  return <FilesStorage />;
};

export default FilesStoragePage;
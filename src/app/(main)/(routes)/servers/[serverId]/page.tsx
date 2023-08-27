type ServerPageProps = {
  params: {
    serverId: string;
  };
};

const ServerPage = ({ params: { serverId } }: ServerPageProps) => {
  return <div>ServerPage</div>;
};

export default ServerPage;

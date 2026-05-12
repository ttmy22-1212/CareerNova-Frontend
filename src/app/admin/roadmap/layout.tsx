import { TopicProvider } from "@/contexts/topic/topic-context";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <TopicProvider>{children}</TopicProvider>;
};
export default Layout;

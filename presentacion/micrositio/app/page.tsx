import PresentationClient from './components/presentation-client';
import { loadChapters } from './lib/content';

export default function HomePage() {
  const chapters = loadChapters();

  return <PresentationClient chapters={chapters} />;
}

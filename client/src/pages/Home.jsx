import HeroFeatured from '../components/home/HeroFeatured';
import PromoCarousel from '../components/home/PromoCarousel';
import CalendarWidget from '../components/home/CalendarWidget';
import Stories from '../components/home/Stories';
import ExploreClub from '../components/home/ExploreClub';
import MembershipPromo from '../components/home/MembershipPromo';
import NewsGrid from '../components/home/NewsGrid';
import LetterForm from '../components/home/LetterForm';
import PlayerSlider from '../components/home/PlayerSlider';
import { TornEdge } from '../components/ui/Art';

export default function Home() {

  return (
    <>
      <HeroFeatured />
      <PromoCarousel />
      <CalendarWidget />

      <div className="parchment-run bg-parchment">
        <TornEdge position="top" seed={3} />
        <Stories />
        <ExploreClub />
        <TornEdge position="bottom" seed={9} />
      </div>

      <MembershipPromo />

      <div className="parchment-run bg-parchment">
        <TornEdge position="top" seed={17} />
        <NewsGrid />
        <TornEdge position="bottom" seed={23} />
      </div>

      <LetterForm />
      <PlayerSlider />
    </>
  );
}

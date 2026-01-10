import { useState } from 'react';
import { Heart, Bookmark, Clock, Users, ChefHat, Send, Share2, Link2, Copy, Check } from 'lucide-react';

import { PixelButton } from '../components/PixelButton';
import { PixelTag } from '../components/PixelTag';
import { useNav } from '../hooks/useNav';
import { AddToCollectionModal } from "@/components/modals/AddToCollectionModal";
import {RECIPE, COMMENTS} from '@/mocks/mock_recipe_detail'
interface RecipeDetailProps {
  isLoggedIn?: boolean;
}

export function RecipeDetail({ isLoggedIn = false}: RecipeDetailProps) {
  const [isLiked, setIsLiked] = useState(RECIPE.isLiked);
  const [isSaved, setIsSaved] = useState(RECIPE.isSaved);
  const [likes, setLikes] = useState(RECIPE.likes);

  const [showAddToJar, setShowAddToJar] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const nav = useNav();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };
  
  const handleBookmark = () => {
    if (!isLoggedIn) {
      nav.login();
      return;
    }

    if (isSaved) {
      // optional: toast "Already saved"
      return;
    }

    setShowAddToJar(true);
  };

  const toggleStep = (index: number) => {
    if (checkedSteps.includes(index)) {
      setCheckedSteps(checkedSteps.filter(i => i !== index));
    } else {
      setCheckedSteps([...checkedSteps, index]);
    }
  };

  const handleCopyLink = () => {
    // In a real app, this would copy the actual URL
    const recipeUrl = `https://cookie.exe/recipe/${RECIPE.id}`;
    navigator.clipboard.writeText(recipeUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    // Mock share functionality
    console.log(`Sharing to ${platform}`);
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="pixel-card bg-white p-0 mb-8 overflow-hidden">
          <div className="relative aspect-video">
            <img 
              src={RECIPE.image} 
              alt={RECIPE.title} 
              className="w-full h-full object-cover"
            />
            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-3">
              <button
                className={`w-12 h-12 pixel-border flex items-center justify-center backdrop-blur-sm transition-colors ${
                  isLiked ? 'bg-[#FF8FAB]' : 'bg-white/90 hover:bg-white'
                }`}
                onClick={handleLike}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#5D4037]' : ''}`} />
              </button>
              <button
                className={`w-12 h-12 pixel-border flex items-center justify-center backdrop-blur-sm transition-colors ${
                  isSaved ? 'bg-[#4DB6AC]' : 'bg-white/90 hover:bg-white'
                }`}
                onClick={handleBookmark}
              >
                <Bookmark
                  className={`w-6 h-6 ${
                    isSaved ? 'fill-[#5D4037]' : ''
                  }`}
                />
              </button>
              <button
                className="w-12 h-12 pixel-border flex items-center justify-center backdrop-blur-sm transition-colors"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <Share2 className="w-6 h-6" />
              </button>
              {showShareMenu && (
                <div className="absolute top-16 right-4 bg-white pixel-border shadow-lg z-10">
                  <button
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#FFF8E1] transition-colors"
                    onClick={() => handleShare('Facebook')}
                  >
                    <Link2 className="w-4 h-4" />
                    Facebook
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#FFF8E1] transition-colors"
                    onClick={() => handleShare('Twitter')}
                  >
                    <Link2 className="w-4 h-4" />
                    Twitter
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#FFF8E1] transition-colors"
                    onClick={() => handleShare('Email')}
                  >
                    <Link2 className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#FFF8E1] transition-colors"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-4 h-4" />
                    {linkCopied ? <Check className="w-4 h-4" /> : 'Copy Link'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 border-t-[3px] border-[#5D4037]">
            <h1 
              className="text-2xl md:text-3xl mb-4" 
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {RECIPE.title}
            </h1>

            {/* Author */}
            <button 
              className="inline-flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
                onClick ={() => nav.profile(RECIPE.author.username)}
            >
              <div className="w-8 h-8 bg-[#4DB6AC] pixel-border flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
              <span className="text-sm uppercase">by {RECIPE.author.username}</span>
            </button>

            <p className="text-sm mb-6 leading-relaxed">{RECIPE.description}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <span className="text-sm uppercase">{RECIPE.difficulty}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm uppercase">{RECIPE.prepTime} prep</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm uppercase">{RECIPE.cookTime} cook</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm uppercase">{RECIPE.servings}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-[#FF8FAB]" />
                <span className="text-sm uppercase">{likes} likes</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {RECIPE.tags.map((tag) => (
                <PixelTag key={tag} label={tag} />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="pixel-card bg-white p-6 sticky top-24">
              <h2 
                className="text-sm mb-6" 
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Ingredients
              </h2>
              <ul className="space-y-3">
                {RECIPE.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 bg-[#5D4037] mt-2 shrink-0"></span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="pixel-card bg-white p-6">
              <h2 
                className="text-sm mb-6" 
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Instructions
              </h2>
              <div className="space-y-4">
                {RECIPE.steps.map((step, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 pixel-border bg-[#FFF8E1] cursor-pointer hover:bg-[#FFF8E1]/70 transition-colors"
                    onClick={() => toggleStep(index)}
                  >
                    <div className={`w-6 h-6 pixel-border flex items-center justify-center shrink-0 transition-colors ${
                      checkedSteps.includes(index) ? 'bg-[#4DB6AC]' : 'bg-white'
                    }`}>
                      {checkedSteps.includes(index) && <span className="text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <div className={`mb-1 uppercase text-xs ${checkedSteps.includes(index) ? 'text-[#4DB6AC]' : 'text-[#5D4037]/70'}`}>
                        Step {index + 1}
                      </div>
                      <p className={`text-sm ${checkedSteps.includes(index) ? 'line-through text-[#4DB6AC]/70' : ''}`}>
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="pixel-card bg-white p-6">
              <h2 
                className="text-sm mb-6" 
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Comments ({COMMENTS.length})
              </h2>

              {/* Comment Input */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 pixel-border bg-[#FFF8E1] placeholder:text-[#5D4037]/50"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <PixelButton variant="primary" size="md">
                    <Send className="w-4 h-4" />
                  </PixelButton>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {COMMENTS.map((comment) => (
                  <div key={comment.id} className="pb-4 border-b-2 border-[#5D4037] last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <button 
                        className="uppercase text-sm hover:underline"
                        onClick={() => nav.profile(comment.author)}
                      >
                        {comment.author}
                      </button>
                      <span className="text-xs text-[#5D4037]/50">• {comment.timestamp}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* ===== Add To Jar Modal ===== */}
        {showAddToJar && (
          <AddToCollectionModal
            onClose={() => setShowAddToJar(false)}
            onAdd={(jarId) => {
              console.log('Add recipe', RECIPE.id, 'to jar', jarId);
              setIsSaved(true);
              setShowAddToJar(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
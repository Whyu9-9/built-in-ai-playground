import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WriterDemo from '../views/WriterDemo.vue'
import SummarizerDemo from '../views/SummarizerDemo.vue'
import RewriterDemo from '../views/RewriterDemo.vue'
import TranslatorDemo from '../views/TranslatorDemo.vue'
import LanguageDetectorDemo from '../views/LanguageDetectorDemo.vue'
import PromptDemo from '../views/PromptDemo.vue'
import PromptImageDemo from '../views/PromptImageDemo.vue'
import PromptAudioDemo from '../views/PromptAudioDemo.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/writer',
      name: 'writer',
      component: WriterDemo,
    },
    {
      path: '/summarizer',
      name: 'summarizer',
      component: SummarizerDemo,
    },
    {
      path: '/rewriter',
      name: 'rewriter',
      component: RewriterDemo,
    },
    {
      path: '/translator',
      name: 'translator',
      component: TranslatorDemo,
    },
    {
      path: '/language-detector',
      name: 'language-detector',
      component: LanguageDetectorDemo,
    },
    {
      path: '/prompt',
      name: 'prompt',
      component: PromptDemo,
    },
    {
      path: '/prompt-image',
      name: 'prompt-image',
      component: PromptImageDemo,
    },
    {
      path: '/prompt-audio',
      name: 'prompt-audio',
      component: PromptAudioDemo,
    },
  ],
})

export default router

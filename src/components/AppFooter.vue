<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <footer class="app-footer">
    <div class="footer-brand">© Только по люБВИ</div>
    <div class="footer-links">
      <RouterLink to="/contacts">Контакты</RouterLink>
      <RouterLink to="/privacy-policy">Политика конфиденциальности</RouterLink>
      <RouterLink to="/consent">Согласие на обработку персональных данных</RouterLink>
      <RouterLink to="/public-offer">Публичная оферта</RouterLink>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: 18px 16px 22px;
  border-top: 1px solid rgba(205, 186, 255, 0.2);
  background: linear-gradient(135deg, rgba(18, 12, 37, 0.75), rgba(18, 12, 37, 0.6));
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-brand {
  color: var(--color-text-primary);
  font-weight: 700;
}

.footer-links {
  display: grid;
  gap: 8px;
  width: max-content;
}

.footer-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--color-accent-bright);
}

@media (max-width: 600px) {
  .footer-links {
    width: 100%;
  }
}
</style>

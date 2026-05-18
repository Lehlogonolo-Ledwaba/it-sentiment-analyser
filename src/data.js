// src/data.js — Sample IT feedback dataset

const SAMPLE_DATA = [
  {
    category: 'cloud',
    source: 'AWS review',
    text: 'AWS has been rock solid for our infrastructure. Auto-scaling works perfectly and the uptime has been exceptional. Cost management tools could be improved though.',
  },
  {
    category: 'security',
    source: 'Slack #infosec',
    text: 'The new CrowdStrike rollout caused massive performance issues. Half our dev machines are running at 40% CPU just from the endpoint agent. Really frustrated with this.',
  },
  {
    category: 'devtools',
    source: 'Developer survey',
    text: 'GitHub Copilot has genuinely transformed our workflow. Code review time dropped by 30% and junior devs are shipping much more confidently.',
  },
  {
    category: 'support',
    source: 'Helpdesk ticket',
    text: 'Password reset took 3 days to resolve. The IT support portal is confusing and I had to follow up 4 times. Completely unacceptable for a critical system.',
  },
  {
    category: 'vendor',
    source: 'Vendor meeting notes',
    text: 'Microsoft 365 licensing costs increased again with no clear value add. The Teams interface is cluttered and call quality is inconsistent across our offices.',
  },
  {
    category: 'cloud',
    source: 'Azure feedback',
    text: 'Azure DevOps pipelines have been reliable. Good integration with our existing Microsoft stack. Documentation is decent but could use more real-world examples.',
  },
];

const CAT_LABELS = {
  cloud: 'Cloud & infra',
  security: 'Cybersecurity',
  devtools: 'Dev tools',
  support: 'IT support',
  vendor: 'Vendor feedback',
};

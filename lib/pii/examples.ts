export interface ExamplePrompt { label: string; text: string }

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    label: 'Payment reminder email',
    text: 'Draft a payment-reminder email to Sarah Chen at sarah.chen@acme.com — her invoice tied to card 4111 1111 1111 1111 is overdue.',
  },
  {
    label: 'Support ticket',
    text: 'Customer John Doe called from +1 (415) 555-0142 about his account; his SSN is 123-45-6789 and he wants a refund.',
  },
  {
    label: 'Debugging an integration',
    text: 'Our integration uses API key sk-proj-abc123XYZ456def789 and the server at 192.168.1.42 keeps timing out — can you debug?',
  },
]

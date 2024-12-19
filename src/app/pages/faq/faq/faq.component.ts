import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {
  faqs = [
    {
      question: 'A Charmosa oferece frete grátis?',
      answer: 'Oferecemos frete gratuito via FedEx (serviço de 3 a 5 dias) para todos os pedidos acima de US$ 100 antes dos impostos.',
      isOpen: false
    },
    {
      question: 'Para onde a Charmosa envia?',
      answer: 'Enviamos para todos os estados do Brasil e para diversos países no exterior. Consulte nossa política de envio para mais detalhes.',
      isOpen: false
    },
    {
      question: 'Quando meu pedido será enviado?',
      answer: 'Os pedidos são enviados em até 2 dias úteis após a confirmação do pagamento.',
      isOpen: false
    }
  ];
  faqsTw = [
    {
      question: 'Redes sociais',
      answer: 'Siga-nos nas redes sociais para receber cupons e descontos especiais em sorteios e promoções.',
      isOpen: false
    },
    {
      question: 'Programas de fidelidade',
      answer: 'Participe do nosso programa de fidelidade e acumule pontos para trocar por cupons de desconto.',
      isOpen: false
    },
    {
      question: 'Promoções sazonais',
      answer: 'Fique atento às nossas promoções em datas especiais, onde distribuímos cupons para nossos clientes.',
      isOpen: false
    }
  ];
  faqsTr = [
    {
      question: 'Trocas e devoluções',
      answer: 'Confira nossa política de trocas e devoluções para saber como proceder em caso de insatisfação com o produto.',
      isOpen: false
    },
    {
      question: 'Formas de pagamento',
      answer: 'Oferecemos diversas formas de pagamento, como cartão de crédito, boleto bancário e outras opções.',
      isOpen: false
    },
    {
      question: 'Prazo de entrega',
      answer: 'O prazo de entrega depende da sua localização e da modalidade de envio escolhida no momento da compra.',
      isOpen: false
    }
  ];

  

  toggleAnswer(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  toggleAnswerTw(index: number): void {
    this.faqsTw[index].isOpen = !this.faqsTw[index].isOpen;
  }
  toggleAnswerTr(index: number): void {
    this.faqsTr[index].isOpen = !this.faqsTr[index].isOpen;
  }
}

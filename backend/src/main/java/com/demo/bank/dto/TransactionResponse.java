package com.demo.bank.dto;

import com.demo.bank.entity.Transaction;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private Transaction.TransactionType type;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private String counterpartyAccount;
    private String category;
    private Transaction.TransactionStatus status;
    private LocalDateTime createdAt;
    private Long accountId;
    private String accountNumber;

    public static TransactionResponse from(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .type(t.getType())
                .amount(t.getAmount())
                .balanceAfter(t.getBalanceAfter())
                .description(t.getDescription())
                .counterpartyAccount(t.getCounterpartyAccount())
                .category(t.getCategory())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .accountId(t.getAccount().getId())
                .accountNumber(t.getAccount().getAccountNumber())
                .build();
    }
}

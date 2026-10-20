package com.demo.bank.dto;

import com.demo.bank.entity.Account;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private Account.AccountType accountType;
    private BigDecimal balance;
    private BigDecimal minimumBalance;
    private BigDecimal availableCredit;
    private Account.AccountStatus status;
    private LocalDateTime createdAt;
    private Long userId;
    private String ownerName;

    public static AccountResponse from(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .minimumBalance(account.getMinimumBalance())
                .availableCredit(account.getAvailableCredit())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .userId(account.getUser().getId())
                .ownerName(account.getUser().getName())
                .build();
    }
}

package com.demo.bank.service;

import com.demo.bank.dto.*;
import com.demo.bank.entity.*;
import com.demo.bank.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public UserResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.getPassword().equals(req.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        if (!user.isActive()) {
            throw new RuntimeException("Account is frozen. Contact support.");
        }

        UserResponse response = UserResponse.from(user);
        List<AccountResponse> accounts = accountRepository.findByUserId(user.getId())
                .stream().map(AccountResponse::from).toList();
        response.setAccounts(accounts);
        return response;
    }

    @Transactional
    public UserResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .password(req.getPassword())
                .role(User.Role.CUSTOMER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(user);

        BigDecimal minBalance = req.getAccountType() == Account.AccountType.SAVINGS
                ? BigDecimal.valueOf(500) : BigDecimal.valueOf(1000);

        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .accountType(req.getAccountType())
                .balance(req.getInitialDeposit())
                .minimumBalance(minBalance)
                .availableCredit(BigDecimal.valueOf(10000))
                .status(Account.AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();
        accountRepository.save(account);

        if (req.getInitialDeposit() != null && req.getInitialDeposit().compareTo(BigDecimal.ZERO) > 0) {
            Transaction initialTx = Transaction.builder()
                    .type(Transaction.TransactionType.DEPOSIT)
                    .amount(req.getInitialDeposit())
                    .balanceAfter(req.getInitialDeposit())
                    .description("Initial Deposit - Account Opening")
                    .category("Deposit")
                    .status(Transaction.TransactionStatus.COMPLETED)
                    .createdAt(LocalDateTime.now())
                    .account(account)
                    .build();
            transactionRepository.save(initialTx);
        }

        UserResponse response = UserResponse.from(user);
        response.setAccounts(List.of(AccountResponse.from(account)));
        return response;
    }

    private String generateAccountNumber() {
        String prefix = "1000";
        String digits = String.format("%08d", new Random().nextInt(100000000));
        String candidate = prefix + digits;
        while (accountRepository.existsByAccountNumber(candidate)) {
            digits = String.format("%08d", new Random().nextInt(100000000));
            candidate = prefix + digits;
        }
        return candidate;
    }
}

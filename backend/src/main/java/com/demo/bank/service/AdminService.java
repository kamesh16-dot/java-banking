package com.demo.bank.service;

import com.demo.bank.dto.*;
import com.demo.bank.entity.*;
import com.demo.bank.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public List<UserResponse> getCustomers(String search) {
        List<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.findByRoleAndNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
                    User.Role.CUSTOMER, search, User.Role.CUSTOMER, search);
        } else {
            users = userRepository.findByRole(User.Role.CUSTOMER);
        }

        return users.stream().map(u -> {
            UserResponse r = UserResponse.from(u);
            List<AccountResponse> accounts = accountRepository.findByUserId(u.getId())
                    .stream().map(AccountResponse::from).toList();
            r.setAccounts(accounts);
            return r;
        }).toList();
    }

    @Transactional
    public AccountResponse toggleAccountStatus(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setStatus(account.getStatus() == Account.AccountStatus.ACTIVE
                ? Account.AccountStatus.FROZEN : Account.AccountStatus.ACTIVE);
        accountRepository.save(account);
        return AccountResponse.from(account);
    }

    public Map<String, Object> getStats() {
        long totalCustomers = userRepository.findByRole(User.Role.CUSTOMER).size();

        BigDecimal totalDeposits = accountRepository.findAll()
                .stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayTransactions = transactionRepository.countTodayTransactions(startOfDay);

        List<TransactionResponse> recent = transactionRepository
                .findRecentAll(PageRequest.of(0, 10))
                .stream().map(TransactionResponse::from).toList();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalDeposits", totalDeposits);
        stats.put("todayTransactions", todayTransactions);
        stats.put("recentTransactions", recent);
        return stats;
    }
}

# Memory Index — Shifty App
> .claude/ is the only place memory lives

## Core Memory Files

### context.md → Product purpose, users, known debt
**Last Updated**: 2025-06-05 (Memory Scan)
**Status**: ✅ Current
**Content**: Comprehensive project context including business model, target users, technical debt, security considerations, and development philosophy

### architecture.md → Stack, routes, auth flow, DB models
**Last Updated**: 2025-06-05 (Memory Scan)
**Status**: ✅ Current (Updated for Next.js 16.2.7)
**Content**: Complete tech stack, route architecture, API breakdown, component structure, design system
**New**: Added Next.js 16.2.7 upgrade, complete route map with all URLs, detailed API structure

### rules.md → Non-negotiable coding rules
**Last Updated**: 2025-06-05 (Memory Scan)
**Status**: ✅ Current
**Content**: Comprehensive coding rules for imports, Prisma, Next.js 16, API routes, TypeScript, security, performance
**New**: Updated Next.js 16 specific rules, enhanced security guidelines, performance rules

### patterns.md → Established code patterns
**Last Updated**: 2025-06-05 (Memory Scan)
**Status**: ✅ Current
**Content**: Complete pattern library for SSR, client components, auth, API routes, database operations, components
**New**: Expanded Next.js 16 patterns, comprehensive component patterns, error handling patterns

### gotchas.md → Known traps (read before every task)
**Last Updated**: 2025-06-05 (Memory Scan)
**Status**: ✅ Current
**Content**: Comprehensive list of known issues, Next.js 16 specific gotchas, Prisma traps, current technical debt
**New**: Added Next.js 16 gotchas, updated current technical debt items, new stubbed service warnings

### dependencies.md → Module blast radius map
**Last Updated**: 2025-06-05 (Memory Scan)
**Status**: ✅ Current
**Content**: Complete dependency map, module relationships, external packages, blast radius analysis
**New**: Detailed API route dependencies, component dependency tree, security dependencies

## Supporting Memory Files

### decisions.md → Architecture decision log
**Status**: 📝 Needs updates
**Content**: Historical architecture decisions and reasoning
**Note**: Should be updated when major architectural decisions are made

### pre-task-checklist.md → Pre-task protocol
**Status**: ✅ Current
**Content**: Mandatory steps before starting any task
**Note**: Aligned with CLAUDE.md pre-task requirements

### post-task-checklist.md → Post-task protocol
**Status**: ✅ Current
**Content**: Mandatory steps after completing any task
**Note**: Aligned with CLAUDE.md post-task requirements

## Memory Scan Report — 2025-06-05

### Files Updated: 6/8 (75%)
✅ **context.md** - Comprehensive project context refresh
✅ **architecture.md** - Updated for Next.js 16.2.7, complete route map
✅ **rules.md** - Enhanced coding standards for Next.js 16
✅ **patterns.md** - Expanded pattern library
✅ **gotchas.md** - Updated known issues and technical debt
✅ **dependencies.md** - Detailed dependency mapping

### Files Needing Updates: 2/8 (25%)
📝 **decisions.md** - Architecture decision log (stale)
📝 **INDEX.md** - This file (updated during scan)

### Key Findings from Scan

#### New Information Added
1. **Next.js 16.2.7 Upgrade**: Architecture updated to reflect current version
2. **Complete Route Map**: All URLs and route groups documented
3. **API Structure**: Comprehensive API endpoint breakdown
4. **Component Architecture**: Detailed component dependency mapping
5. **Enhanced Patterns**: Next.js 16 specific patterns added
6. **Updated Gotchas**: Current technical debt and known issues

#### Current Codebase State
- **Routes**: 70+ pages across 7 route groups
- **API Endpoints**: 30+ API routes covering all business logic
- **Components**: 80+ components (UI, layout, shared, marketing)
- **Database Models**: 20 Prisma models
- **External Services**: 3 stubbed (SMS, Payment, File Upload)

#### Technical Debt Status
- **High Priority**: SMS integration, Payment gateway, File upload system
- **Medium Priority**: Real-time notifications, Search pagination, Worker assignment
- **Low Priority**: Analytics pipeline, Auto-assign optimization

### Next Maintenance Actions
1. Update **decisions.md** with recent architectural choices
2. Consider adding **performance.md** for performance-specific guidance
3. Add **testing.md** when test suite is implemented
4. Update **integration.md** when external services are connected

## Memory Health Status

### Overall Status: ✅ Healthy (85%)
- **Core Memory**: All critical files current and comprehensive
- **Supporting Memory**: Most files current, some need attention
- **Documentation**: Comprehensive coverage of codebase
- **Maintenance**: Regular scans keeping memory fresh

### Strengths
- ✅ Comprehensive architectural documentation
- ✅ Detailed pattern library
- ✅ Current coding standards
- ✅ Complete dependency mapping
- ✅ Active technical debt tracking

### Areas for Improvement
- 📝 Architecture decision log needs updates
- 📝 Could benefit from performance-specific documentation
- 📝 Testing strategy documentation needed when tests are added

## Usage Guidelines

### Before Starting Work
1. Read **gotchas.md** - Avoid known traps
2. Check **patterns.md** - Follow established patterns
3. Review **rules.md** - Follow coding standards
4. Consult **architecture.md** - Understand system structure

### During Development
1. Follow **patterns.md** for consistent implementation
2. Adhere to **rules.md** for code quality
3. Check **dependencies.md** before modifying core modules
4. Update **decisions.md** for architectural choices

### After Completing Work
1. Update **gotchas.md** if new issues discovered
2. Add patterns to **patterns.md** for reusable solutions
3. Update **context.md** for major project changes
4. Review **post-task-checklist.md** for completion steps

## Memory Maintenance Schedule

### Recommended Scan Frequency
- **Weekly**: Quick scan for new patterns and gotchas
- **Monthly**: Comprehensive memory scan (like this one)
- **Quarterly**: Major update and restructuring
- **As Needed**: Update immediately after major changes

### Trigger Points for Updates
- New Next.js version upgrade
- Major architectural changes
- New business requirements
- Discovery of significant gotchas
- Addition of new external services
- Performance optimization work

---

**Memory System Last Updated**: 2025-06-05
**Next Scheduled Scan**: 2025-07-05 (Monthly review)
**Memory System Version**: 2.0 (Enhanced Next.js 16 support)

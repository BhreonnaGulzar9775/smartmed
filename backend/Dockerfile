FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["backend/SmartMed.Api/SmartMed.Api.csproj", "backend/SmartMed.Api/"]
RUN dotnet restore "backend/SmartMed.Api/SmartMed.Api.csproj"

COPY backend/ ./backend/

WORKDIR "/src/backend/SmartMed.Api"
RUN dotnet publish "SmartMed.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SmartMed.Api.dll"]